# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    module Feats
      class AddCommand < BaseCommand
        include Deps[
          add_spell: 'commands.characters_context.pathfinder2.spells.add'
        ]

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
          add_extra_feats(input)
          add_focus_spells(input)

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

        def add_extra_feats(input)
          return if input[:feat].info['extra_feats'].blank?

          ::Pathfinder2::Feat.where(slug: input[:feat].info['extra_feats']).ids.each do |id|
            Charkeeper::Container.resolve('commands.characters_context.pathfinder2.feats.add').call(
              character: input[:character],
              id: id,
              type: 'additional',
              level: input[:level]
            )
          end
        end

        def add_focus_spells(input)
          return if input[:feat].info['focus_spells'].blank?

          input[:feat].info['focus_spells'].each do |slug|
            spell = ::Pathfinder2::Feat.where(origin: 4).find_by(slug: slug)
            next unless spell

            add_spell.call({
              character: input[:character], feat: spell, level: spell.info['level'], kind: 'focus'
            }.compact_blank)
          end
        end
      end
    end
  end
end
