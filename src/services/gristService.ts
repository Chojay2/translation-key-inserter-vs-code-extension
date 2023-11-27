import axios, { AxiosResponse } from 'axios';

export class GristService {
  private apiKey: string;
  private gristURL: string;

  constructor(apiKey: string, gristURL: string) {
    this.apiKey = apiKey;
    this.gristURL = gristURL;
  }

  public async fetchRecords(docId: string, tableId: string): Promise<any> {
    try {
      const recordsResponse: AxiosResponse<any> = await axios.get(
        `${this.gristURL}/docs/${docId}/tables/${tableId}/records`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return recordsResponse.data;
    } catch (error) {
      console.error('Error fetching records from Grist:', error);
      throw error;
    }
  }

  public async writeTransformedText(
    docId: string,
    tableId: string,
    transformedText: string,
    selectedText: string
  ): Promise<void> {
    try {
      const dataToWrite = {
        records: [
          {
            fields: {
              transformedText,
              selectedText,
            },
          },
        ],
      };

      await axios.post(`${this.gristURL}/docs/${docId}/tables/${tableId}/records`, dataToWrite, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    } catch (error) {
      console.error('Error writing transformed text to Grist:', error);
      throw error;
    }
  }

  // Other methods for updating, deleting records, etc.
}
