# frozen_string_literal: true

describe Frontend::Pathfinder2::Characters::RestController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:user_character) {
    create :character,
           :pathfinder2,
           user: user_session.user,
           data: {
             main_class: 'bard', health_current: 1, spent_spell_slots: { '1': 2 }, level: 3
           }
  }
  let!(:feat) { create :feat, :pathfinder2, origin: 1, origin_value: 'dwarf', origin_values: [] }
  let!(:character_feat) { create :character_feat, feat: feat, character: user_character, used_count: 1 }
  let!(:spell) { create :feat, :pathfinder2, origin: 4, origin_values: [] }
  let!(:character_spell) {
    create :character_feat, feat: spell, character: user_character, value: { '1' => { 'selected_count' => 2, 'used_count' => 1 } }
  }

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          post :create, params: { character_id: user_character.id, charkeeper_access_token: access_token, constitution: 3 }
        }

        it 'updates character', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(user_character.reload.data.health_current).to eq 7
          expect(user_character.data.spent_spell_slots).to eq({ '1' => 0 })
          expect(character_feat.reload.used_count).to eq 0
          expect(character_spell.reload.value.dig('1', 'selected_count')).to eq 2
          expect(character_spell.value.dig('1', 'used_count')).to eq 0
        end
      end

      context 'with health_limit' do
        context 'for user character' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, charkeeper_access_token: access_token, constitution: 3, health_limit: 6
            }
          }

          it 'updates character', :aggregate_failures do
            request

            expect(response).to have_http_status :ok
            expect(user_character.reload.data.health_current).to eq 6
            expect(user_character.data.spent_spell_slots).to eq({ '1' => 0 })
            expect(character_feat.reload.used_count).to eq 0
            expect(character_spell.reload.value.dig('1', 'selected_count')).to eq 2
            expect(character_spell.value.dig('1', 'used_count')).to eq 0
          end
        end
      end
    end
  end
end
