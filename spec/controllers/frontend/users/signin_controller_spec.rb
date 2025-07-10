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
        it 'render access token' do
          post :create, params: { user: { username: user.username, password: user.password } }

          expect(response).to have_http_status :created
        end
      end
    end
  end
end
