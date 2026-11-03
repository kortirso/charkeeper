# frozen_string_literal: true

describe Webhooks::TelegramsController do
  describe 'POST#create' do
    before { allow(Charkeeper::Container.resolve('monitoring.client')).to receive(:notify) }

    context 'for message webhook' do
      it 'calls handler', :aggregate_failures do
        expect {
          post :create, params: {
            message: {
              from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
              chat: { id: '123' },
              text: '/start'
            }
          }
        }.to(
          have_enqueued_job(WebhooksContext::Telegram::ReceiveMessageJob).with(message: {
            from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
            chat: { id: '123' },
            text: '/start'
          })
        )
        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(response).to have_http_status :ok
      end
    end

    context 'for chat member webhook' do
      before { create :user_identity, provider: 'telegram', uid: '123' }

      it 'calls monitoring', :aggregate_failures do
        expect {
          post :create, params: {
            my_chat_member: {
              from: { first_name: 'First', last_name: 'Last', username: 'User', language_code: 'en' },
              chat: { id: 123 },
              new_chat_member: { status: 'kicked' }
            }
          }
        }.to have_enqueued_job(WebhooksContext::Telegram::ReceiveChatMemberJob)
        expect(Charkeeper::Container.resolve('monitoring.client')).to have_received(:notify)
        expect(response).to have_http_status :ok
      end
    end
  end
end
