# frozen_string_literal: true

describe HomebrewContext::Daggerheart::CopySubclassCommand do
  subject(:command_call) { instance.call({ user: another_user, subclass: Daggerheart::Homebrew::Subclass.find(subclass.id) }) }

  let(:instance) { described_class.new }
  let!(:another_user) { create :user }
  let!(:user) { create :user }
  let!(:speciality) { create :homebrew_speciality, :daggerheart, user: user }
  let!(:subclass) { create :homebrew_subclass, :daggerheart, user: user, class_name: speciality.id }

  before do
    create :feat, :rally, user: user, origin: 2, origin_value: speciality.id
    create :feat, :rally, user: user, origin: 3, origin_value: subclass.id
  end

  it 'creates new class and subclass with feats', :aggregate_failures do
    expect { command_call }.to(
      change(Daggerheart::Homebrew::Speciality.where(user_id: another_user.id), :count).by(1)
        .and(change(Daggerheart::Homebrew::Subclass.where(user_id: another_user.id), :count).by(1))
        .and(change(Feat.where(user_id: another_user.id), :count).by(2))
    )
    expect(command_call[:errors]).to be_nil
  end

  context 'for default class' do
    let!(:subclass) { create :homebrew_subclass, :daggerheart, user: user, class_name: 'bard' } # rubocop: disable RSpec/LetSetup

    before { create :feat, :rally, user: user, origin: 2, origin_value: 'bard' }

    it 'creates new class and subclass with feats', :aggregate_failures do
      expect { command_call }.to(
        change(Daggerheart::Homebrew::Subclass.where(user_id: another_user.id), :count).by(1)
          .and(change(Feat.where(user_id: another_user.id), :count).by(2))
      )
      expect(command_call[:errors]).to be_nil
      expect(Daggerheart::Homebrew::Speciality.where(user_id: another_user.id).count).to eq 0
    end
  end
end
