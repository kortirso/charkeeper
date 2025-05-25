# frozen_string_literal: true

describe Webhooks::TelegramsController do
  describe 'POST#create' do
    let(:handler) { Charkeeper::Container.resolve('commands.webhooks_context.receive_telegram_webhook') }

    before do
      allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify)
      allow(handler).to receive(:call)
    end

    context 'when message present in payload', :aggregate_failures do
      it 'calls monitoring' do
        post :create, params: {
          message: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: 'id' },
            text: 'text'
          }
        }

        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(handler).to(
          have_received(:call).with(message: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: 'id' },
            text: 'text'
          })
        )
        expect(response).to have_http_status :ok
      end
    end
  end
end
