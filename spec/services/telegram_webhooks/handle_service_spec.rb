# frozen_string_literal: true

describe TelegramWebhooks::HandleService do
  subject(:service_call) { described_class.new.call(message: message) }

  let(:message) do
    {
      from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
      chat: { id: 'id' },
      text: text
    }
  end
  let(:client) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    allow(client).to receive(:send_message)
  end

  context 'for existing bot command' do
    let(:text) { '/start' }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end
  end

  context 'for unexisting message' do
    let(:text) { 'unexisting' }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end
  end
end
