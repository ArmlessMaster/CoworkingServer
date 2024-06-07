interface SendMail extends Object {
    accepted: Array<string>;
    rejected: Array<string>;
    ehlo: Array<string>;
    envelopeTime: number;
    messageTime: number;
    messageSize: number;
    response: string;
    envelope: { from: string; to: Array<string> };
    messageId: string;
}

export default SendMail;
