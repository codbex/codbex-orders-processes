import { Controller, Post, response } from "sdk/http";
import { Process } from 'sdk/bpm';

@Controller
class ProcessService {

    @Post("/order")
    public startCheckout(entity: any) {

        const processInstanceName = `New Sales Order`;

        const processId = Process.start('checkout-process', processInstanceName, {
            orderData: entity
        });

        Process.setProcessInstanceName(processId, processInstanceName);
        response.setStatus(response.OK);

        return `Started Process with id ${processId}`;
    }
}

