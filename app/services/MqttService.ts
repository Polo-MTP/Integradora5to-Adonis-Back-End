import mqtt from 'mqtt'

class MqttService {
    private client: mqtt.MqttClient

    constructor() {
        const url = 'http://13.59.132.191:1883'
        this.client = mqtt.connect(url)

        this.client.on('connect', () => {
            console.log('MQTT connected')
        })

        this.client.on('error', (error) => {
            console.log('MQTT error', error)
        })

        this.client.on('message', (topic, message)=> {
            console.log('MQTT message', topic, message.toString())
        })
    }

    subscibe(topic: string) {
        this.client.subscribe(topic, (err)=> {
            if(err) {
                console.log('Error subscribing to topic', err)
            }
            else {
                console.log('Subscribed to topic', topic)
            }
        })
    }

    publish(topic: string, message: string) {
        this.client.publish(topic, message)
    }

    getClient() {
        return this.client
    }
}

export default new MqttService()