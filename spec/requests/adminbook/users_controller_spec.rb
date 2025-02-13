# frozen_string_literal: true

describe 'Users' do
  describe 'GET#index' do
    context 'without users' do
      it 'renders index page' do
        get '/adminbook/users'

        expect(response).to have_http_status :ok
      end
    end

    context 'with users' do
      let!(:user1) { create :user }
      let!(:user2) { create :user }

      it 'renders index page', :aggregate_failures do
        get '/adminbook/users'

        expect(response).to have_http_status :ok
        expect(response.body).to include(user1.id)
        expect(response.body).to include(user2.id)
      end
    end
  end
end
