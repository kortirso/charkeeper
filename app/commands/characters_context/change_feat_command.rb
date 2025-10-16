# frozen_string_literal: true

module CharactersContext
  class ChangeFeatCommand < BaseCommand
    include Deps[
      character_dnd5_update: 'commands.characters_context.dnd5.update',
      character_dnd2024_update: 'commands.characters_context.dnd2024.update',
      character_daggerheart_update: 'commands.characters_context.daggerheart.update'
    ]

    use_contract do
      config.messages.namespace = :character_feat

      params do
        required(:character_feat).filled(type?: ::Character::Feat)
        optional(:active).filled(:bool)
        optional(:used_count).filled(:integer)
        optional(:value)
      end
    end

    private

    def do_prepare(input)
      return unless input.key?(:value)

      input[:key] =
        case input[:character_feat].character.type
        when 'Dnd5::Character' then :selected_feats
        when 'Dnd2024::Character', 'Daggerheart::Character' then :selected_features
        end
      return if input[:key].nil?

      input[input[:key]] = { input[:character_feat].feat.slug => input[:value] }
    end

    # rubocop: disable Metrics/AbcSize
    def do_persist(input)
      input[:character_feat].update!(input.except(:character_feat, :selected_feats, :selected_features, :key))

      if input[:key]
        data = input[:character_feat].character.data
        refresh_character(input).call(
          :character => input[:character_feat].character.class.find(input[:character_feat].character_id),
          input[:key] => (data[input[:key]] || {}).merge(input[input[:key]])
        )
      end

      { result: input[:character_feat] }
    end
    # rubocop: enable Metrics/AbcSize

    def refresh_character(input)
      case input[:character_feat].character.type
      when 'Dnd5::Character' then character_dnd5_update
      when 'Dnd2024::Character' then character_dnd2024_update
      when 'Daggerheart::Character' then character_daggerheart_update
      end
    end
  end
end
