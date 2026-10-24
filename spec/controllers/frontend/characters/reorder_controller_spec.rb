# frozen_string_literal: true

describe Frontend::Characters::ReorderController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:character) { create :pathfinder2_character }
  let!(:user_character1) { create :pathfinder2_character, user: user_session.user }
  let!(:user_character2) { create :pathfinder2_character, user: user_session.user }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for valid request' do
        let(:request) {
          post :create, params: {
            character_ids: [user_character2.id, character.id, user_character1.id],
            charkeeper_access_token: access_token
          }
        }

        it 'updates characters order', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(character.reload.position).to be_nil
          expect(user_character1.reload.position).to eq 1
          expect(user_character2.reload.position).to eq 0
        end
      end
    end
  end
end
