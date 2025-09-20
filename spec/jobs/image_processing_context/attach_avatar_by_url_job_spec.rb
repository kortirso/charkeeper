# frozen_string_literal: true

describe ImageProcessingContext::AttachAvatarByUrlJob do
  subject(:job_call) { described_class.perform_now(character_id: character_id, url: 'something') }

  let!(:character) { create :character }
  let(:service) { double }

  before do
    allow(Charkeeper::Container).to receive(:resolve).and_return(service)
    allow(service).to receive(:call)
  end

  context 'for unexisting character' do
    let(:character_id) { 'unexisting' }

    it 'does not call service' do
      job_call

      expect(service).not_to have_received(:call)
    end
  end

  context 'for existing character' do
    let(:character_id) { character.id }

    it 'calls service' do
      job_call

      expect(service).to have_received(:call).with(character: Character.find(character.id), url: 'something')
    end
  end
end
