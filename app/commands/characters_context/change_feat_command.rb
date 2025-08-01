# frozen_string_literal: true

module CharactersContext
  class ChangeFeatCommand < BaseCommand
    use_contract do
      config.messages.namespace = :character_feat

      params do
        required(:character_feat).filled(type?: ::Character::Feat)
        optional(:used_count).filled(:integer)
        optional(:value)
      end
    end

    private

    def do_prepare(input)
      input[:key] =
        case input[:character_feat].character.type
        when 'Dnd5::Character' then :selected_feats
        when 'Dnd2024::Character' then :selected_features
        end
      return if input[:key].nil?

      input[input[:key]] = { input[:character_feat].feat.slug => input[:value] }
    end

    def do_persist(input)
      input[:character_feat].update!(input.except(:character_feat, :selected_feats, :selected_features, :key))

      if input[:key]
        data = input[:character_feat].character.data
        data[input[:key]] = (data[input[:key]] || {}).merge(input[input[:key]])
        input[:character_feat].character.save
      end

      { result: input[:character_feat] }
    end
  end
end
