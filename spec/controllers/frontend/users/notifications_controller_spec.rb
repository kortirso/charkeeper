# frozen_string_literal: true

describe Frontend::Users::NotificationsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token } }

      context 'without notifications' do
        it 'renders empty list', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['notifications'].size).to eq 0
        end
      end

      context 'with notifications' do
        let!(:notification) { create :user_notification, user: user_session.user }

        it 'renders notifications', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['notifications'].size).to eq 1
          expect(notification.reload.read).to be_truthy
        end
      end
    end
  end

  describe 'GET#unread' do
    context 'for logged users' do
      let(:request) { get :unread, params: { charkeeper_access_token: access_token } }

      context 'without notifications' do
        it 'renders unread notifications count', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['unread']).to eq 0
        end
      end

      context 'with unread notifications' do
        let!(:notification) { create :user_notification, user: user_session.user }

        it 'renders unread notifications count', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['unread']).to eq 1
          expect(notification.reload.read).to be_falsy
        end
      end
    end
  end
end
