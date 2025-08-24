# frozen_string_literal: true

describe Frontend::Users::SigninsController do
  describe 'POST#create' do
    it 'renders error' do
      post :create, params: { user: { username: 'something', password: 'invalid_password' } }

      expect(response).to have_http_status :unprocessable_content
    end

    context 'for existing user' do
      let(:user) { create :user }

      context 'for invalid password' do
        it 'renders error' do
          post :create, params: { user: { username: user.username, password: 'invalid_password' } }

          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for empty password' do
        it 'renders error' do
          post :create, params: { user: { username: user.username, password: '' } }

          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid password' do
        it 'renders access token' do
          post :create, params: { user: { username: user.username, password: user.password } }

          expect(response).to have_http_status :created
        end

        context 'with platform' do
          let(:request) do
            post :create, params: { user: { username: user.username, password: user.password }, platform: 'macos' }
          end

          context 'when platform exists' do
            before { create :user_platform, user: user, name: 'macos' }

            it 'does not create platform', :aggregate_failures do
              expect { request }.not_to change(user.platforms, :count)
              expect(response).to have_http_status :created
            end
          end

          context 'when platform does not exist' do
            it 'creates platform', :aggregate_failures do
              expect { request }.to change(user.platforms, :count).by(1)
              expect(response).to have_http_status :created
            end
          end
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    let!(:user_session) { create :user_session }
    let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

    context 'for logged users' do
      let(:request) do
        delete :destroy, params: { charkeeper_access_token: access_token }
      end

      it 'remove session', :aggregate_failures do
        expect { request }.to change(User::Session, :count).by(-1)
        expect(response).to have_http_status :ok
      end
    end
  end
end
