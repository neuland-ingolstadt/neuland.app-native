const ENDPOINT = 'https://dev.neuland.app';
const ENDPOINT_MODE = process.env.NEXT_PUBLIC_NEULAND_API_MODE || 'direct';
const ENDPOINT_HOST = process.env.NEXT_PUBLIC_NEULAND_API_HOST || '';

class NeulandAPIClient {

  /**
   * Performs a request against the neuland.app API
   * @param {string} url
   */
  async performRequest(url: string): Promise<any> {
    const resp = await fetch(`${ENDPOINT_HOST}${url}`);

    if (resp.status === 200) {
      return await resp.json();
    } else {
      throw new Error('API returned an error: ' + (await resp.text()));
    }
  }

  async getMensaPlan(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/mensa`);
  }

  async getReimannsPlan(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/reimanns`);
  }

  async getCanisiusPlan(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/canisius`);
  }

  /**
   * @param {string} station Bus station identifier
   */
  async getBusPlan(station: string): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/bus/${encodeURIComponent(station)}`);
  }

  /**
   * @param {string} station Train station identifier
   */
  async getTrainPlan(station: string): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/train/${encodeURIComponent(station)}`);
  }

  async getParkingData(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/parking`);
  }

  async getCharingStationData(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/charging-stations`);
  }

  async getCampusLifeEvents(): Promise<any> {
    return this.performRequest(`${ENDPOINT}/api/cl-events`);
  }
}

export default new NeulandAPIClient();
