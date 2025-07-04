# frozen_string_literal: true

describe Adminbook::Users::NotificationsController do
  describe 'POST#create' do
    let!(:user) { create :user }
    let(:telegram_api) { Charkeeper::Container.resolve('api.telegram.client') }

    before do
      allow(telegram_api).to receive(:send_message)
    end

    context 'for invalid params' do
      let(:request) { post :create, params: { notification: { title: '', value: '', user_id: nil } } }

      it 'does not create notification', :aggregate_failures do
        expect { request }.not_to change(User::Notification, :count)
        expect(telegram_api).not_to have_received(:send_message)
      end
    end

    context 'for valid params' do
      let(:request) { post :create, params: { notification: { title: 'Title', value: 'Value', user_id: user.id } } }

      it 'creates notification without telegram message', :aggregate_failures do
        expect { request }.to change(user.notifications, :count).by(1)
        expect(telegram_api).not_to have_received(:send_message)
      end

      context 'with google identity' do
        before { create :user_identity, provider: 'google', user: user }

        it 'creates notification without telegram message', :aggregate_failures do
          expect { request }.to change(user.notifications, :count).by(1)
          expect(telegram_api).not_to have_received(:send_message)
        end
      end

      context 'with telegram identity' do
        before { create :user_identity, provider: 'telegram', user: user }

        it 'creates notification with telegram message', :aggregate_failures do
          expect { request }.to change(user.notifications, :count).by(1)
          expect(telegram_api).to have_received(:send_message)
        end
      end
    end
  end
end
