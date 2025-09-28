import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '../../../lib/server-contract';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromBlock = searchParams.get('fromBlock');
  
  try {
    const serverContract = getServerContract();
    
    // Get past UserVerified events
    const events = await serverContract.getPastUserVerifiedEvents(
      fromBlock ? parseInt(fromBlock) : 0
    );
    
    // Format events for response
    const formattedEvents = events.map(event => {
      const eventLog = event as any; // Type assertion for event args
      return {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        user: eventLog.args?.[0] || '',
        output: eventLog.args?.[1] || {},
        userData: eventLog.args?.[2] || '',
        timestamp: null // Would need additional RPC call to get block timestamp
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        count: formattedEvents.length
      }
    });
    
  } catch (error) {
    console.error('Error getting contract events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get contract events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}