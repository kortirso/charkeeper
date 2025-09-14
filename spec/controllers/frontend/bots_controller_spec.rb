# frozen_string_literal: true

describe Frontend::BotsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) { post :create, params: { value: value, charkeeper_access_token: access_token } }

      context 'for invalid command' do
        let(:value) { '/module create d20 abc' }

        it 'returns errors messages', :aggregate_failures do
          request

          expect(response.parsed_body[:errors]).to eq(['Неизвестное значение'])
          expect(response).to have_http_status :ok
        end
      end

      context 'for invalid arguments' do
        let(:value) { '/module set d20' }

        it 'returns errors messages', :aggregate_failures do
          request

          expect(response.parsed_body[:errors]).to eq(['Запись не найдена'])
          expect(response).to have_http_status :ok
        end
      end

      context 'for valid params' do
        let(:value) { '/roll d20' }

        it 'returns result', :aggregate_failures do
          request

          expect(response.parsed_body[:result].include?('Результат: d20')).to be_truthy
          expect(response.parsed_body[:errors]).to be_nil
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
