import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";
import abi from "./abi.json";


const CONTRACT = "0x47b585983acd9a26aa44736ccf20bd4f2203fdb6";

const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/dCrpRYTNq-bZ5184G-VyneKSdiq6TtjL");
const privateKey = "0xbc2353bd52d22ced56ad4b5c19e59bac6ee864d94957073d07f15fdb03792dd0";
const wallet = new ethers.Wallet(privateKey, provider);


async function checkBalance(address: any) {
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT,
      abi: abi.abi,
      functionName: "balanceOf",
      args: [address, 0],
    });
    const readableBalance = Number(balance);
    return readableBalance;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function remainingSupply() {
  try {
    const balance = 100000;
    const readableBalance = Number(balance);
    return readableBalance;
  } catch (error) {
    console.log(error);
    return error;
  }
}

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
});


app.frame("/", async (c) => {
  const balance = await remainingSupply();
  console.log(balance);
  if (typeof balance === "number" && balance === 0) {
    return c.res({
      image:
        "https://dweb.mypinata.cloud/ipfs/QmeeXny8775RQBZDhSppkRN15zn5nFjQUKeKAvYvdNx986",
      imageAspectRatio: "1:1",
      intents: [
        <Button.Link href="https://warpcast.com/~/channel/pinata">
          Join the Pinata Channel
        </Button.Link>,
      ],
      title: "Pinta Hat Store - SOLD OUT",
    });
  } else {
    return c.res({
      action: "/finish",
      image:
        "https://dweb.mypinata.cloud/ipfs/QmeC7uQZqkjmc1T6sufzbJWQpoeoYjQPxCXKUSoDrXfQFy",
      imageAspectRatio: "1:1",
      intents: [
        <Button.Transaction target="/buy/0.0005">
          Buy for 0.005 ETH
        </Button.Transaction>,
        <Button action="/ad">Watch ad for 1/2 off</Button>,
      ],
      title: "Pinta Hat Store",
    });
  }
});

app.frame("/finish", (c) => {
  return c.res({
    image:
      "https://dweb.mypinata.cloud/ipfs/QmZPysm8ZiR9PaNxNGQvqdT2gBjdYsjNskDkZ1vkVs3Tju",
    imageAspectRatio: "1:1",
    intents: [
      <Button.Link href="https://warpcast.com/~/channel/pinata">
        Join the Pinata Channel
      </Button.Link>,
    ],
    title: "Pinta Hat Store",
  });
});

app.frame("/ad", async (c) => {
  return c.res({
    action: "/coupon",
    image:
      "https://dweb.mypinata.cloud/ipfs/QmeUmBtAMBfwcFRLdoaCVJUNSXeAPzEy3dDGomL32X8HuP",
    imageAspectRatio: "1:1",
    intents: [
      <TextInput placeholder="Wallet Address (not ens)" />,
      <Button>Receive Coupon</Button>,
    ],
    title: "Pinta Hat Store", 
  });
});

app.frame("/coupon", async (c) => {
  const supply = await remainingSupply();
  const address = c.inputText;
  const balance = await checkBalance(address);

  if (
    typeof balance === "number" &&
    balance < 1 &&
    typeof supply === "number" &&
    supply > 0
  ) {
    const { request: mint } = await publicClient.simulateContract({
      account,  
      address: CONTRACT,
      abi: abi.abi,
      functionName: "mint",
      args: [address],
    });
    const mintTransaction = await walletClient.writeContract(mint);
    console.log(mintTransaction);

    const mintReceipt = await publicClient.waitForTransactionReceipt({
      hash: mintTransaction,
    });
    console.log("Mint Status:", mintReceipt.status); 
  }

  return c.res({
    action: "/finish",
    image:  
      "https://dweb.mypinata.cloud/ipfs/QmeUmBtAMBfwcFRLdoaCVJUNSXeAPzEy3dDGomL32X8HuP",
    imageAspectRatio: "1:1",
    intents: [
      <Button.Transaction target="/buy/0.0025">
        Buy for 0.0025 ETH
      </Button.Transaction>,
    ],
    title: "Pinta Hat Store",
  });
});


app.frame("/buy/:price", async (c) => {
  const price = c.req.param('price');

  return c.res({
    action: "/finish",
    image: "https://dweb.mypinata.cloud/ipfs/QmeC7uQZqkjmc1T6sufzbJWQpoeoYjQPxCXKUSoDrXfQFy",
    imageAspectRatio: "1:1",
    intents: [
      <Button onClick={async () => {
        const transaction = {
          to: "0x711ACA028ECAEA178EbC29c7059CFdb195FaCD37",
          value: ethers.utils.parseEther(price),
        };

        try {
          const tx = await wallet.sendTransaction(transaction);
          console.log("Transaction sent:", tx.hash);
          // Update UI to indicate that the transaction is pending

          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt.transactionHash);
          // Update UI to indicate that the transaction was successful
        } catch (error) {
          console.error("Transaction failed:", error);
          // Update UI to indicate that the transaction failed
        }
      }}>
        Buy for {price} ETH
      </Button>,
    ],
    title: "Pinta Hat Store",
  });
});

export const GET = handle(app);
export const POST = handle(app);