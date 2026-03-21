# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Feats
      class AddCommand < BaseCommand
        use_contract do
          Types = Dry::Types['strict.string'].enum('ancestry', 'skill', 'general', 'class', 'additional')

          params do
            required(:character).filled(type?: ::Pathfinder2::Character)
            required(:id).filled(:string)
            required(:type).filled(Types)
            required(:level).filled(:integer, gteq?: 1)
          end
        end

        private

        def do_prepare(input)
          input[:feat] = ::Pathfinder2::Feat.find(input[:id])
        end

        def do_persist(input)
          character_feat =
            ::Character::Feat.create_with(ready_to_use: true, selected_count: 0).find_or_create_by(input.slice(:character, :feat))

          character_feat.increment!(:selected_count)
          update_selected_feats(input)

          { result: :ok }
        end

        def update_selected_feats(input)
          selected_feats = input[:character].data.attributes['selected_feats'] || {}

          values = selected_feats[input[:id]] || []
          values << input.slice(:type, :level).stringify_keys
          selected_feats[input[:id]] = values

          input[:character].data = input[:character].data.attributes.merge('selected_feats' => selected_feats)
          input[:character].save!
        end
      end
    end
  end
end
