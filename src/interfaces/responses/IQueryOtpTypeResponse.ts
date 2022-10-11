export interface IQueryOtpTypeResponse {
  readonly clientID: string;
  readonly authMethod: string;
  /**
   * MATRIX => trả về giá trị "16"
   * Hardware OTP => trả về giá trị "8"
   * Smart OTP => trả về giá trị "2"
   */
  readonly authCode: string;
  readonly description: string;
  readonly channelID: string;
  readonly state: string;
}
