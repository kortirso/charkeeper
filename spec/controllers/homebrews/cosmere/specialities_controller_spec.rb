# frozen_string_literal: true

describe Homebrews::Cosmere::SpecialitiesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token } }
      let!(:class1) { create :homebrew_speciality, :cosmere, user: user_session.user }

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['specialities'].size).to eq 1
        expect(response.parsed_body['specialities'].pluck('id')).to contain_exactly(class1.id)
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          brewery: { name: name, data: { names: { en: 'something' }, descriptions: { en: 'something' } } },
          charkeeper_access_token: access_token
        }
      }

      context 'for invalid params' do
        let(:name) { '' }

        it 'does not create homebrew', :aggregate_failures do
          expect { request }.not_to change(Cosmere::Homebrew::Speciality, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid params' do
        let(:name) { 'Artificer' }

        it 'creates homebrew', :aggregate_failures do
          expect { request }.to change(Cosmere::Homebrew::Speciality, :count).by(1)
          expect(response).to have_http_status :created
        end
      end
    end
  end
end
