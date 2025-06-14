# frozen_string_literal: true

describe Web::Users::SignupController do
  describe 'GET#new' do
    it 'renders new template' do
      get :new

      expect(response).to render_template :new
    end
  end

  describe 'POST#create' do
    context 'without credentials' do
      let(:request) { post :create, params: { user: { password: '1' }, locale: 'en' } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to redirect_to new_signup_path
      end
    end

    context 'for username registration' do
      context 'for blank username' do
        let(:request) { post :create, params: { user: { username: '', password: '1' }, locale: 'en' } }

        it 'does not create new user', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to new_signup_path
        end
      end

      context 'for invalid username format' do
        let(:request) { post :create, params: { user: { username: 'user.name', password: '1' }, locale: 'en' } }

        it 'does not create new user', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to new_signup_path
        end
      end

      context 'for short password' do
        let(:request) { post :create, params: { user: { username: 'user', password: '1' }, locale: 'en' } }

        it 'does not create new user', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to new_signup_path
        end
      end

      context 'without password confirmation' do
        let(:request) { post :create, params: { user: { username: 'user', password: '1234567890' }, locale: 'en' } }

        it 'does not create new user', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to new_signup_path
        end
      end

      context 'for existing user' do
        let!(:user) { create :user }
        let(:request) {
          post :create, params: {
            user: { username: user.username, password: '1234567890', password_confirmation: '1234567890' }
          }
        }

        it 'does not create new user', :aggregate_failures do
          expect { request }.not_to change(User, :count)
          expect(response).to redirect_to new_signup_path
        end
      end

      context 'for valid data' do
        let(:user_params) { { username: 'user-name', password: '1234567890', password_confirmation: '1234567890' } }
        let(:request) { post :create, params: { user: user_params, locale: 'en' } }

        it 'creates new user', :aggregate_failures do
          expect { request }.to change(User, :count).by(1)
          expect(User.last.username).to eq 'user-name'
          expect(response).to redirect_to root_path
        end
      end
    end
  end
end
