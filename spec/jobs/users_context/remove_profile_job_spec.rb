# frozen_string_literal: true

describe UsersContext::RemoveProfileJob do
  subject(:job_call) { described_class.perform_now(user_id: user_id) }

  let!(:user) { create :user }

  context 'for unexisting user' do
    let(:user_id) { 'unexisting' }

    it 'does not remove user' do
      expect { job_call }.not_to change(User, :count)
    end
  end

  context 'for existing user' do
    let(:user_id) { user.id }

    it 'removes user' do
      expect { job_call }.to change(User, :count).by(-1)
    end
  end
end
