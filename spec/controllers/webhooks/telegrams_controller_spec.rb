# frozen_string_literal: true

describe Webhooks::TelegramsController do
  describe 'POST#create' do
    before { allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify) }

    context 'for message webhook' do
      let(:handler) { Charkeeper::Container.resolve('commands.webhooks_context.telegram.receive_message_webhook') }

      before { allow(handler).to receive(:call) }

      it 'calls handler', :aggregate_failures do
        post :create, params: {
          message: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: '123' },
            text: '/start'
          }
        }

        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(handler).to(
          have_received(:call).with(message: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: '123' },
            text: '/start'
          })
        )
        expect(response).to have_http_status :ok
      end
    end

    context 'for chat member webhook' do
      let!(:identity) { create :user_identity, provider: 'telegram', uid: '123' }

      it 'calls monitoring', :aggregate_failures do
        post :create, params: {
          my_chat_member: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: 123 },
            new_chat_member: { status: 'kicked' }
          }
        }

        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(identity.reload.active).to be_falsy
        expect(response).to have_http_status :ok
      end
    end
  end
end
