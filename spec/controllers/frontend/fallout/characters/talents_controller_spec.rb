# frozen_string_literal: true

describe Frontend::Fallout::Characters::TalentsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:user_character) do
    CharactersContext::Fallout::CreateCommand.new.call(
      user: user_session.user, name: 'name', origin: 'mutant'
    )[:result]
  end
  let!(:feat) do
    create :feat, :rally, type: 'Fallout::Feat', origin: 0, conditions: { attrs: { int: 7 }, level: 1 }, info: { ranks: 1 }
  end

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

            response_values = response.parsed_body.dig('perks', 0)

            expect(response).to have_http_status :ok
            expect(response.parsed_body['perks'].size).to eq 1
            expect(response_values['full_ranked']).to be_falsy
          end
        end

        context 'with feats' do
          before do
            create :character_feat, feat: feat, character: user_character

            user_character.data.perks = { feat.id => 1 }
            user_character.save
          end

          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            response_values = response.parsed_body.dig('perks', 0)

            expect(response).to have_http_status :ok
            expect(response.parsed_body['perks'].size).to eq 1
            expect(response_values['full_ranked']).to be_truthy
          end
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', talent_id: feat.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          post :create, params: { character_id: user_character.id, talent_id: feat.id, charkeeper_access_token: access_token }
        }

        context 'without feats' do
          it 'returns data', :aggregate_failures do
            expect { request }.to change(Character::Feat, :count).by(1)
            expect(response).to have_http_status :ok
            expect(user_character.reload.data.perks).to eq({ feat.id => 1 })
          end
        end

        context 'with feats' do
          before do
            create :character_feat, feat: feat, character: user_character

            user_character.data.perks = { feat.id => 1 }
            user_character.save
          end

          it 'returns error', :aggregate_failures do
            expect { request }.not_to change(Character::Feat, :count)
            expect(response).to have_http_status :unprocessable_content
            expect(response.parsed_body['errors_list']).to eq(
              [I18n.t('commands.characters_context.fallout.talents.add.full_rank')]
            )
          end
        end
      end
    end
  end
end
