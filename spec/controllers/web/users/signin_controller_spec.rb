# frozen_string_literal: true

describe Web::Users::SigninController do
  describe 'GET#new' do
    it 'renders new template' do
      get :new, params: { locale: 'en' }

      expect(response).to render_template :new
    end
  end

  describe 'POST#create' do
    context 'for existing user' do
      let(:user) { create :user }

      context 'for invalid password' do
        it 'renders new template' do
          post :create, params: { user: { username: user.username, password: 'invalid_password' } }

          expect(response).to redirect_to new_signin_path
        end
      end

      context 'for empty password' do
        it 'renders new template' do
          post :create, params: { user: { username: user.username, password: '' } }

          expect(response).to redirect_to new_signin_path
        end
      end

      context 'for valid password' do
        it 'redirects to root path' do
          post :create, params: { user: { username: user.username, password: user.password } }

          expect(response).to redirect_to root_path
        end
      end
    end
  end

  describe 'GET#destroy' do
    it 'redirects to root path' do
      get :destroy

      expect(response).to redirect_to root_path
    end
  end
end
