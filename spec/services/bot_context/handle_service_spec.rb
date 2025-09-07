# frozen_string_literal: true

describe BotContext::HandleService do
  subject(:service_call) do
    I18n.with_locale(:en) do
      described_class.new.call(source: source, message: text, data: { raw_message: message })
    end
  end

  let(:message) do
    {
      message_id: 1,
      from: { language_code: 'en' },
      chat: { id: 1 },
      text: text
    }
  end
  let(:text) { '/roll d20' }
  let(:client) { Charkeeper::Container.resolve('api.telegram.client') }

  before do
    allow(client).to receive(:send_message)
  end

  context 'for existing bot command' do
    let(:source) { :telegram_group_bot }

    it 'sends response message' do
      service_call

      expect(client).to have_received(:send_message)
    end
  end

  context 'for web request' do
    let(:source) { :web }

    it 'sends response message', :aggregate_failures do
      expect(service_call[:result].include?('Result: d20')).to be_truthy
      expect(client).not_to have_received(:send_message)
    end

    context 'for invalid request' do
      let(:text) { '/roll 20' }

      it 'sends error', :aggregate_failures do
        expect(service_call[:errors].include?('No result')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for unexisting command' do
      let(:text) { '/rolld d20' }

      it 'sends error', :aggregate_failures do
        expect(service_call[:errors].include?('Invalid command')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for argument error' do
      let(:text) { '/module create d20' }

      it 'sends error', :aggregate_failures do
        expect(service_call[:errors].include?('Invalid command')).to be_truthy
        expect(client).not_to have_received(:send_message)
      end
    end

    context 'for service command' do
      let(:text) { '/start' }

      it 'sends response message', :aggregate_failures do
        expect(service_call[:result]).to eq :ok
        expect(client).not_to have_received(:send_message)
      end
    end
  end
end
