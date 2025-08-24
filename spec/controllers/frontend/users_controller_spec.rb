# frozen_string_literal: true

describe Frontend::UsersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'PATCH#update' do
    context 'for logged users' do
      it 'updates user', :aggregate_failures do
        patch :update, params: { user: { locale: 'en' }, charkeeper_access_token: access_token }

        expect(response).to have_http_status :ok
        expect(user_session.user.reload.locale).to eq 'en'
      end

      context 'for empty request' do
        it 'returns error', :aggregate_failures do
          patch :update, params: { user: { locale: '' }, charkeeper_access_token: access_token }

          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']['locale']).to eq(['Необходимо указать локаль'])
        end
      end

      context 'for invalid request' do
        it 'returns error', :aggregate_failures do
          patch :update, params: { user: { locale: 'it' }, charkeeper_access_token: access_token }

          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']['locale']).to eq(['Недопустимое значение локали'])
        end
      end
    end
  end
end
