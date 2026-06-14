# frozen_string_literal: true

describe ImportContext::Dnd5::BeyondService do
  subject(:service_call) { described_class.new.call(user: user, data: data) }

  let!(:user) { create :user }
  let(:data) { JSON.parse(Rails.root.join('spec/fixtures/beyond5.json').read) }

  it 'creates character' do
    expect { service_call }.to change(Character, :count).by(1)
  end
end
