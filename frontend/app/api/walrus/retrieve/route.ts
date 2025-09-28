import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

async function retrieve(blobId: string): Promise<Buffer | null> {
    try {
        const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });

        return Buffer.from(response.data);
    } catch (error: any) {
        console.error(`Error downloading blob: ${error.message}`);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const blobId = searchParams.get('blobId');
        
        if (!blobId) {
            return NextResponse.json({ error: 'No blob ID provided' }, { status: 400 });
        }

        const data = await retrieve(blobId);

        if (data) {
            // Convert buffer to string (assuming the data is JSON or text)
            const content = data.toString('utf-8');
            
            return NextResponse.json({ 
                success: true, 
                data: content,
                message: 'Identity data retrieved successfully' 
            }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to download blob' }, { status: 500 });
        }
    } catch (error: any) {
        console.error(`Unexpected error: ${error.message}`);
        return NextResponse.json({
            error: 'An unexpected error occurred',
            details: error.message
        }, { status: 500 });
    }
}
