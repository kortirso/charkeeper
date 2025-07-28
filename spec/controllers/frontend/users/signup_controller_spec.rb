# frozen_string_literal: true

describe Frontend::Users::SignupController do
  describe 'POST#create' do
    context 'without credentials' do
      let(:request) { post :create, params: { user: { password: '1' } } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to have_http_status :unprocessable_entity
      end
    end

    context 'for blank username' do
      let(:request) { post :create, params: { user: { username: '', password: '1' } } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to have_http_status :unprocessable_entity
      end
    end

    context 'for invalid username format' do
      let(:request) { post :create, params: { user: { username: 'user.name', password: '1' } } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to have_http_status :unprocessable_entity
      end
    end

    context 'for short password' do
      let(:request) { post :create, params: { user: { username: 'user', password: '1' } } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to have_http_status :unprocessable_entity
      end
    end

    context 'without password confirmation' do
      let(:request) { post :create, params: { user: { username: 'user', password: '1234567890' } } }

      it 'does not create new user', :aggregate_failures do
        expect { request }.not_to change(User, :count)
        expect(response).to have_http_status :unprocessable_entity
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
        expect(response).to have_http_status :unprocessable_entity
      end
    end

    context 'for valid data' do
      let(:user_params) { { username: 'user-name', password: '1234567890', password_confirmation: '1234567890' } }
      let(:request) { post :create, params: { user: user_params } }

      it 'creates new user', :aggregate_failures do
        expect { request }.to change(User, :count).by(1)
        expect(User.last.username).to eq 'user-name'
        expect(response).to have_http_status :created
      end

      context 'with platform' do
        let(:request) { post :create, params: { user: user_params, platform: 'macos' } }

        it 'creates platform', :aggregate_failures do
          expect { request }.to change(User::Platform, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end
end
