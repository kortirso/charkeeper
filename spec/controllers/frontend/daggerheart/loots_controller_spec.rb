# frozen_string_literal: true

describe Frontend::Daggerheart::LootsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      before do
        Config.data('daggerheart', 'loot_tables')['item'].each do |slug|
          create :item, :daggerheart, slug: slug, kind: 'item'
        end
        Config.data('daggerheart', 'loot_tables')['consumables'].each do |slug|
          create :item, :daggerheart, slug: slug, kind: 'consumables'
        end
      end

      context 'for item type' do
        it 'returns random item', :aggregate_failures do
          post :create, params: { charkeeper_access_token: access_token, type: 'item', dices: 6 }

          response_value = response.parsed_body['item']

          expect(response).to have_http_status :ok
          expect(response_value['kind']).to eq 'item'
          expect(response_value.keys).to(
            contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew', 'has_description', 'original_name')
          )
        end
      end

      context 'for consumables type' do
        it 'returns random item', :aggregate_failures do
          post :create, params: { charkeeper_access_token: access_token, type: 'consumables', dices: 6 }

          response_value = response.parsed_body['item']

          expect(response).to have_http_status :ok
          expect(response_value['kind']).to eq 'consumables'
          expect(response_value.keys).to(
            contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew', 'has_description', 'original_name')
          )
        end
      end

      context 'for invalid type' do
        it 'returns random item', :aggregate_failures do
          post :create, params: { charkeeper_access_token: access_token, type: 'invalid', dices: 6 }

          response_value = response.parsed_body['item']

          expect(response).to have_http_status :ok
          expect(response_value['kind']).to eq 'item'
          expect(response_value.keys).to(
            contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew', 'has_description', 'original_name')
          )
        end
      end

      context 'for invalid dices' do
        it 'returns random item', :aggregate_failures do
          post :create, params: { charkeeper_access_token: access_token, type: 'invalid', dices: 60 }

          response_value = response.parsed_body['item']

          expect(response).to have_http_status :ok
          expect(response_value['kind']).to eq 'item'
          expect(response_value.keys).to(
            contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew', 'has_description', 'original_name')
          )
        end
      end
    end
  end
end
