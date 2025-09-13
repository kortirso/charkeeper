# frozen_string_literal: true

describe AuthContext::AddIdentityCommand do
  subject(:command_call) { instance.call({ user: user, uid: uid, provider: provider }.compact) }

  let(:instance) { described_class.new }
  let(:user) { create :user }
  let(:uid) { '123' }
  let(:provider) { 'telegram' }

  context 'without user' do
    let(:user) { nil }

    it 'creates identity and user', :aggregate_failures do
      expect { command_call }.to(
        change(User::Identity, :count).by(1)
          .and(change(User, :count).by(1))
      )
      expect(command_call[:result].is_a?(User::Identity)).to be_truthy
    end
  end

  context 'with user' do
    it 'creates identity', :aggregate_failures do
      expect { command_call }.to change(User::Identity, :count).by(1)
      expect(command_call[:result].is_a?(User::Identity)).to be_truthy
    end
  end

  context 'for existing identity' do
    before { create :user_identity, uid: '123', provider: 'telegram' }

    it 'does not create identity', :aggregate_failures do
      expect { command_call }.not_to change(User::Identity, :count)
      expect(command_call[:result]).to be_nil
      expect(command_call[:errors_list]).to eq(['Already exists'])
    end
  end
end
