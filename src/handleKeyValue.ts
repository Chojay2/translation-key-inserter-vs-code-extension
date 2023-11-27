import { GristService } from "./services/gristService";

// Replace these with your actual Grist API key and URL
const apiKey = 'ef4f7bfd94a4385a6a5d71dea94d4614b99412ea';
const gristURL = 'https://docs.getgrist.com/api';

const grist = new GristService(apiKey, gristURL);

// Usage example
const docId = 'm4iPTTkDkTyYSsxoSRBgQz';
const tableId = 'Talbu';


export default async function saveToGrist(
    transformedText: string,
    selectedText: string
  ): Promise<void> {
  
    try {
      await grist.writeTransformedText(docId, tableId, transformedText, selectedText);
      console.log('Data written to Grist successfully!');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }