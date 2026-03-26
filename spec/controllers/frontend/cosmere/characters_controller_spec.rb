# frozen_string_literal: true

describe Frontend::Cosmere::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: { character: { name: 'Грундар' }, charkeeper_access_token: access_token }
      }

      it 'creates character', :aggregate_failures do
        expect { request }.to change(user_session.user.characters, :count).by(1)
        expect(response).to have_http_status :created
      end

      context 'for invalid request' do
        let(:request) {
          post :create, params: { character: { name: '' }, charkeeper_access_token: access_token }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Character, :count)
          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']).not_to be_nil
        end
      end
    end
  end
end
