# frozen_string_literal: true

describe Frontend::Cthulhu7::Characters::CopyController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for invalid character' do
        let(:request) {
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }
        }

        it 'does not create character', :aggregate_failures do
          expect { request }.not_to change(Character, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for valid character' do
        let!(:character) { create :character, :cthulhu7, user: user_session.user }
        let(:request) {
          post :create, params: { character_id: character.id, charkeeper_access_token: access_token }
        }

        before { create :character_item, character: character }

        it 'creates character', :aggregate_failures do
          expect { request }.to(
            change(Character, :count).by(1)
              .and(change(Character::Item, :count).by(1))
          )
          expect(response).to have_http_status :created
        end
      end
    end
  end
end
