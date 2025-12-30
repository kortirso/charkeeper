# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Reset
      class PerformCommand < BaseCommand
        include Deps[refresh_feats: 'services.characters_context.daggerheart.refresh_feats']

        use_contract do
          config.messages.namespace = :daggerheart_character

          params do
            required(:character).filled(type?: ::Daggerheart::Character)
          end
        end

        private

        def do_prepare(input)
          data = input[:character].data
          input[:attributes] = {
            'level' => 1,
            'classes' => { data.main_class => 1 },
            'subclasses' => data.subclasses.slice(data.main_class),
            'subclasses_mastery' => { data.subclasses[data.main_class] => 1 },
            'domains' => {},
            'health_marked' => 0,
            'stress_marked' => 0,
            'hope_marked' => 0,
            'spent_armor_slots' => 0,
            'leveling' => ::Daggerheart::CharacterData::LEVELING,
            'experience' => [],
            'beastform' => nil,
            'transformation' => nil,
            'selected_stances' => [],
            'stance' => nil,
            'selected_features' => {},
            'conditions' => []
          }
        end

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          input[:character].data = input[:character].data.attributes.merge(input[:attributes])
          input[:character].save!

          input[:character].feats.joins(:feat).where(feats: { origin: 7 }).delete_all
          input[:character].bonuses.delete_all
          input[:character].companion&.destroy
          input[:character].notes.destroy_all
          refresh_feats.call(character: input[:character])

          { result: :ok }
        end
      end
    end
  end
end
