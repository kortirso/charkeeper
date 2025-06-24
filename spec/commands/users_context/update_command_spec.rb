# frozen_string_literal: true

describe UsersContext::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:user) { create :user, username: 'old' }
  let!(:perfect_user) { create :user, username: 'perfect' }

  context 'for username' do
    let(:params) { { user: user, username: username } }

    context 'for username in use' do
      let(:username) { 'perfect' }

      it 'does not update user', :aggregate_failures do
        expect(command_call[:errors]).not_to be_nil
        expect(user.reload.username).to eq 'old'
        expect(perfect_user.reload.username).to eq 'perfect'
      end
    end

    context 'for valid username' do
      let(:username) { 'nice' }

      it 'updates user', :aggregate_failures do
        expect(command_call[:errors]).to be_nil
        expect(user.reload.username).to eq 'nice'
      end
    end
  end
end
