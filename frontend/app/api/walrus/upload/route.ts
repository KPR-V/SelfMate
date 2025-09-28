import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

async function upload(fileBuffer: Buffer): Promise<string> {
    try {
        const url = `${PUBLISHER}/v1/blobs`;

        const response = await axios({
            method: 'put',
            url: url,
            data: fileBuffer,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        const jsonResponse = response.data;
        console.log('Walrus upload response:', response.status);

        if (jsonResponse.alreadyCertified) {
            return jsonResponse.alreadyCertified.blobId;
        }

        return jsonResponse.newlyCreated.blobObject.blobId;
    } catch (error: any) {
        console.error(`Error uploading file: ${error.message}`);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate request data
        if (!body || !body.data) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Convert data to buffer
        const fileBuffer = Buffer.from(body.data, 'utf-8');

        // Upload file directly
        const blobId = await upload(fileBuffer);
        console.log('Uploaded blob ID:', blobId);

        return NextResponse.json({ 
            success: true, 
            blobId,
            message: 'Identity data uploaded successfully' 
        }, { status: 200 });

    } catch (error: any) {
        console.error(`Unexpected error: ${error.message}`);

        // Differentiate between different types of errors
        if (error.name === 'TypeError') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        return NextResponse.json({
            error: 'An unexpected error occurred',
            details: error.message
        }, { status: 500 });
    }
}
