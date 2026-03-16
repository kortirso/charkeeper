# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Subclasses
      class CopyCommand < BaseCommand
        include Deps[
          add_subclass: 'commands.homebrew_context.dnd.subclasses.add',
          copy_feats: 'commands.homebrew_context.dnd.feats.copy'
        ]

        use_contract do
          params do
            required(:subclass).filled(type?: ::Dnd2024::Homebrew::Subclass)
            required(:user).filled(type?: ::User)
          end
        end

        private

        def do_prepare(input)
          input[:subclass_attributes] =
            input[:subclass].data.attributes.symbolize_keys.merge({
              name: input[:subclass].name, user: input[:user]
            })
        end

        def do_persist(input)
          result = ActiveRecord::Base.transaction do
            origin_value = find_class_origin_value(input)

            subclass = add_subclass.call(input[:subclass_attributes].merge({
              class_name: origin_value
            }))[:result]
            # скопировать навыки подкласса
            copy_feats.call(
              feats: Dnd2024::Feat.where(origin: 3, origin_value: input[:subclass].id).to_a,
              user: input[:user],
              origin_value: subclass.id
            )

            subclass
          end

          { result: result }
        end

        def find_class_origin_value(input)
          input[:subclass].class_name
        end
      end
    end
  end
end
