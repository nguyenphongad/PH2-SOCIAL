import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'chat-service',
    brokers: [process.env.KAFKA_BROKER],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-group' });

const kafkaSetup = async (io) => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: true });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}`);
            io.emit('newMessage', JSON.parse(message.value.toString()));
        },
    });
};

export default kafkaSetup;