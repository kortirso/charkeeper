# frozen_string_literal: true

describe WebhooksContext::Telegram::HandleBotCommandService do
  subject(:service_call) { described_class.new.call(command_text: command_text) }

  context 'for roll command' do
    context 'for simple argument' do
      let(:command_text) { '/roll d20' }

      it 'returns result' do
        expect(service_call.include?('*Result*: d20')).to be_truthy
      end
    end

    context 'for simple argument with modifier' do
      let(:command_text) { '/roll d20+2' }

      it 'returns result' do
        expect(service_call.include?('*Result*: d20+2')).to be_truthy
      end
    end

    context 'for many simple arguments with modifier' do
      let(:command_text) { '/roll d20+2 d12' }

      it 'returns result', :aggregate_failures do
        expect(service_call.include?('*Result*: d20+2')).to be_truthy
        expect(service_call.include?('d12 (')).to be_truthy
      end
    end
  end
end
