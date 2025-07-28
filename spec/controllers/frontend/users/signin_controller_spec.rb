# frozen_string_literal: true

describe Frontend::Users::SigninController do
  describe 'POST#create' do
    it 'renders error' do
      post :create, params: { user: { username: 'something', password: 'invalid_password' } }

      expect(response).to have_http_status :unprocessable_entity
    end

    context 'for existing user' do
      let(:user) { create :user }

      context 'for invalid password' do
        it 'renders error' do
          post :create, params: { user: { username: user.username, password: 'invalid_password' } }

          expect(response).to have_http_status :unprocessable_entity
        end
      end

      context 'for empty password' do
        it 'renders error' do
          post :create, params: { user: { username: user.username, password: '' } }

          expect(response).to have_http_status :unprocessable_entity
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
end
