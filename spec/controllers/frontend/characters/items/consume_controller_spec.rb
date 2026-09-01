# frozen_string_literal: true

describe Frontend::Characters::Items::ConsumeController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:character) { create :pathfinder2_character }
  let!(:user_character) { create :pathfinder2_character, user: user_session.user }
  let!(:potion) { create :item, info: { consume: [{ attribute: 'health_current', formula: '2 * D(8) + 5' }] } }
  let!(:character_item) do
    create :character_item, character: user_character, item: potion, states: {
      'hands' => 0, 'equipment' => 2, 'backpack' => 0, 'storage' => 0
    }
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: {
            character_id: 'unexisting',
            item_id: 'unexisting',
            provider: 'pathfinder2',
            from_state: 'hands',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: {
            character_id: character.id,
            item_id: character_item.id,
            provider: 'pathfinder2',
            from_state: 'equipment',
            charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          post :create, params: {
            character_id: user_character.id,
            item_id: character_item.id,
            provider: 'pathfinder2',
            from_state: 'equipment',
            charkeeper_access_token: access_token
          }
        }

        it 'creates character resource', :aggregate_failures do
          request

          expect(user_character.reload.data.health_current >= 8).to be_truthy
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
