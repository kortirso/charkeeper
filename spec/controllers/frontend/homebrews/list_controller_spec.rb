# frozen_string_literal: true

# describe Frontend::Homebrews::ListController do
#   let!(:user_session) { create :user_session }
#   let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

#   describe 'GET#index' do
#     context 'for logged users' do
#       context 'for Daggerheart' do
#         let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }
#         let!(:feat1) { create :feat, :rally, user: user_session.user }
#         let!(:race1) { create :homebrew_race, :daggerheart, user: user_session.user }
#         let!(:speciality1) { create :homebrew_speciality, :daggerheart, user: user_session.user }

#         before do
#           create :feat, :rally
#           create :homebrew_race, :daggerheart
#           create :homebrew_speciality, :daggerheart
#         end

#         it 'returns data', :aggregate_failures do
#           request

#           expect(response).to have_http_status :ok
#           expect(response.parsed_body['races'].size).to eq 1
#           expect(response.parsed_body['races'].pluck('id')).to contain_exactly(race1.id)
#           expect(response.parsed_body['classes'].size).to eq 1
#           expect(response.parsed_body['classes'].pluck('id')).to contain_exactly(speciality1.id)
#           expect(response.parsed_body['feats'].size).to eq 1
#           expect(response.parsed_body['feats'].pluck('id')).to contain_exactly(feat1.id)
#         end
#       end
#     end
#   end
# end
