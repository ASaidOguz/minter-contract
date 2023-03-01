declare global{
namespace NodeJS {
    interface ProcessEnv {
      DEPLOYER_MNEMONIC: string;
      PORT: string;
      MONGO_URI: string;
    }
  }
}

export{}