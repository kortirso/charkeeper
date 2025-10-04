# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class CopyFeatsCommand < BaseCommand
      include Deps[
        add_feat: 'commands.homebrew_context.daggerheart.add_feat',
        add_item: 'commands.homebrew_context.daggerheart.add_item'
      ]

      use_contract do
        params do
          required(:feats).maybe(:array)
          required(:user).filled(type?: ::User)
          required(:origin_value).filled(:string)
        end
      end

      private

      def do_persist(input)
        input[:feats].each do |feat|
          new_feat = add_feat.call(feat_attributes(input, feat).merge({ user: input[:user] }))[:result]
          feat.items.find_each do |item|
            add_item.call(item_attributes(item, new_feat.id).merge({ user: input[:user] }))
          end
        end

        { result: :ok }
      end

      def feat_attributes(input, feat)
        feat
          .attributes
          .slice('origin', 'kind', 'limit', 'limit_refresh')
          .symbolize_keys
          .merge({
            origin_value: input[:origin_value],
            title: feat.title['en'],
            description: feat.description['en'],
            limit: feat.description_eval_variables['limit']
          }).compact
      end

      def item_attributes(item, itemable_id)
        item
          .attributes
          .slice('info', 'kind', 'itemable_type')
          .symbolize_keys
          .merge({
            itemable_id: itemable_id,
            name: item.name['en']
          }).compact
      end
    end
  end
end
