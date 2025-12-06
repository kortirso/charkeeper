# frozen_string_literal: true

describe Frontend::Dc20::Characters::TalentsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:user_character) do
    CharactersContext::Dc20::CreateCommand.new.call(
      user: user_session.user, name: 'name', main_class: 'commander', ancestry_feats: {}
    )[:result]
  end
  let!(:feat) { create :feat, :rally, type: 'Dc20::Feat', origin: 4, origin_value: 'general', info: { multiple: false } }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'without feats' do
          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            response_values = response.parsed_body.dig('talents', 0)

            expect(response).to have_http_status :ok
            expect(response.parsed_body['talents'].size).to eq 1
            expect(response_values['selected']).to be_falsy
          end
        end

        context 'with feats' do
          before do
            create :character_feat, feat: feat, character: user_character

            user_character.data.selected_talents = { feat.id => 1 }
            user_character.save
          end

          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            response_values = response.parsed_body.dig('talents', 0)

            expect(response).to have_http_status :ok
            expect(response.parsed_body['talents'].size).to eq 1
            expect(response_values['selected']).to be_truthy
          end
        end
      end
    end
  end
end
