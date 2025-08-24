# frozen_string_literal: true

describe WebhooksContext::HandleBotCommandService do
  subject(:service_call) { described_class.new.call(command: command, arguments: arguments) }

  context 'for roll command' do
    let(:command) { '/roll' }

    context 'for simple argument' do
      let(:arguments) { ['d20'] }

      it 'returns result' do
        expect(service_call.include?('Result: d20')).to be_truthy
      end
    end

    context 'for simple argument with modifier' do
      let(:arguments) { ['d20+2'] }

      it 'returns result' do
        expect(service_call.include?('Result: d20+2')).to be_truthy
      end
    end

    context 'for many simple arguments with modifier' do
      let(:arguments) { ['d20+2', 'd12'] }

      it 'returns result', :aggregate_failures do
        expect(service_call.include?('Result: d20+2')).to be_truthy
        expect(service_call.include?('d12 (')).to be_truthy
      end
    end
  end
end
