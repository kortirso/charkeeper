# frozen_string_literal: true

describe CharactersContext::ChangeFeatCommand do
  subject(:command_call) { instance.call({ character_feat: character_feat, value: value }) }

  let(:instance) { described_class.new }

  context 'for dnd 5 character' do
    let!(:character) { create :character }

    context 'for simple feat' do
      let!(:feat) { create :feat, :dnd5_bardic_inspiration, kind: 1, origin_value: 'monk' }
      let!(:character_feat) { create :character_feat, character: character, feat: feat }
      let(:value) { 'value' }

      it 'updates feat', :aggregate_failures do
        command_call

        expect(character_feat.reload.value).to eq value
        expect(character.reload.data['selected_feats']).to eq({ feat.slug => 'value' })
      end
    end

    context 'for select feat' do
      let!(:feat) { create :feat, :dnd5_bardic_inspiration, kind: 3, origin_value: 'monk' }
      let!(:character_feat) { create :character_feat, character: character, feat: feat }
      let(:value) { '1' }

      it 'updates feat and character', :aggregate_failures do
        command_call

        expect(character_feat.reload.value).to eq value
        expect(character.reload.data['selected_feats']).to eq({ feat.slug => '1' })
      end
    end
  end

  context 'for dnd 2024 character' do
    let!(:character) { create :character, :dnd2024 }

    context 'for simple feat' do
      let!(:feat) { create :feat, :dnd2024_bardic_inspiration, kind: 1 }
      let!(:character_feat) { create :character_feat, character: character, feat: feat }
      let(:value) { 'value' }

      it 'updates only feat', :aggregate_failures do
        command_call

        expect(character_feat.reload.value).to eq value
        expect(character.reload.data['selected_features']).to eq({ feat.slug => 'value' })
      end
    end

    context 'for select feat' do
      let!(:feat) { create :feat, :dnd2024_bardic_inspiration, kind: 4 }
      let!(:character_feat) { create :character_feat, character: character, feat: feat }
      let(:value) { %w[1 2 3] }

      it 'updates feat and character', :aggregate_failures do
        command_call

        expect(character_feat.reload.value).to eq value
        expect(character.reload.data['selected_features']).to eq({ feat.slug => %w[1 2 3] })
      end
    end
  end
end
